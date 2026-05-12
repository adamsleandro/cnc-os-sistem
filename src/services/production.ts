import { doc, updateDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-utils';

export class ProductionService {
  /**
   * Updates multiple orders to a new status.
   */
  static async updateOrdersStatus(orderIds: string[], status: string) {
    try {
      const promises = orderIds.map(id => 
        updateDoc(doc(db, 'orders', id), {
          status,
          updated_at: serverTimestamp()
        })
      );
      await Promise.all(promises);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'orders');
    }
  }

  /**
   * Saves a nesting project and connects parts.
   */
  static async saveNestingProject(projectData: any, parts: any[]) {
    try {
      // 1. Create Project
      const projectRef = await addDoc(collection(db, 'nesting_projects'), {
        ...projectData,
        created_at: serverTimestamp()
      });

      // 2. Add Parts
      const partPromises = parts.map(part => 
        addDoc(collection(db, `nesting_projects/${projectRef.id}/parts`), {
          ...part,
          project_id: projectRef.id
        })
      );
      await Promise.all(partPromises);

      return projectRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'nesting_projects');
    }
  }
}
