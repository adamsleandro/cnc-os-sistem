import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../core/auth';
import { WorkOrder } from '../types/order.types';
import { Machine } from '../types/machine.types';
import { CutTechnology } from '../types/industrial.types';
import { handleFirestoreError, OperationType } from '../../lib/firestore-utils';

export const useDashboardData = () => {
  const { profile } = useAuth();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [technologies, setTechnologies] = useState<CutTechnology[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!profile?.company_id) return;

    // Real-time Machines
    const machinesQuery = query(
      collection(db, 'machines'), 
      where('company_id', '==', profile.company_id)
    );
    
    const unsubscribeMachines = onSnapshot(machinesQuery, (snapshot) => {
      const machineList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Machine));
      setMachines(machineList);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'machines');
    });

    // Real-time Orders (Include some finished for stats)
    const ordersQuery = query(
      collection(db, 'orders'), 
      where('company_id', '==', profile.company_id),
      orderBy('created_at', 'desc'),
      limit(50)
    );

    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      const orderList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WorkOrder));
      setOrders(orderList);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
    });

    // Real-time technologies
    const techQuery = query(
      collection(db, 'technologies'),
      where('company_id', '==', profile.company_id)
    );

    const unsubscribeTech = onSnapshot(techQuery, (snapshot) => {
      setTechnologies(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CutTechnology)));
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'technologies');
      setIsLoading(false);
    });

    // Real-time events
    const eventQuery = query(
      collection(db, 'machine_events'),
      where('company_id', '==', profile.company_id),
      orderBy('started_at', 'desc'),
      limit(20)
    );

    const unsubscribeEvents = onSnapshot(eventQuery, (snapshot) => {
      setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'machine_events');
    });

    return () => {
      unsubscribeMachines();
      unsubscribeOrders();
      unsubscribeTech();
      unsubscribeEvents();
    };
  }, [profile?.company_id]);

  return { machines, orders, technologies, events, isLoading };
};
