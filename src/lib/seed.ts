import { collection, addDoc, Timestamp, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export async function seedInitialData(companyId: string, userId: string) {
  try {
    // 1. Add Default Machines
    const machines = [
      { name: 'Router CNC 2030 X1', type: 'cnc_router', status: 'disponivel', company_id: companyId, active: true },
      { name: 'Laser CO2 1390', type: 'laser_co2', status: 'disponivel', company_id: companyId, active: true },
      { name: 'Laser Fiber 3015', type: 'laser_fiber', status: 'disponivel', company_id: companyId, active: true },
    ];

    for (const machine of machines) {
      await addDoc(collection(db, 'machines'), {
        ...machine,
        created_at: Timestamp.now()
      });
    }

    // 2. Add Initial Inventory
    const materials = [
      { name: 'ACM Branco 3mm', category: 'ACM', quantity: 20, unit: 'un', min_quantity: 5, company_id: companyId },
      { name: 'Acrílico Cristal 2mm', category: 'Acrílico', quantity: 15, unit: 'un', min_quantity: 3, company_id: companyId },
      { name: 'PVC Expandido 10mm', category: 'PVC', quantity: 10, unit: 'un', min_quantity: 2, company_id: companyId },
    ];

    for (const mat of materials) {
      await addDoc(collection(db, 'inventory'), {
        ...mat,
        created_at: Timestamp.now()
      });
    }

    console.log('Seeding completed!');
    return true;
  } catch (error) {
    console.error('Seeding failed:', error);
    return false;
  }
}
