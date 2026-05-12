import { UserRole, Profile } from '../shared/types/auth.types';

export const usePermissions = (profile: Profile | null) => {
  if (!profile) return {
    canEdit: () => false,
    canSeeCosts: () => false,
    canCancelOrder: () => false,
    canSeeAllOrders: () => false,
    isOperator: () => false,
    isFinishing: () => false,
    isAdmin: () => false,
  };

  return {
    canEdit: (resourceOwnerId?: string) => 
      ['admin', 'gerente', 'programador'].includes(profile.role) || profile.id === resourceOwnerId,
    
    canSeeCosts: () => 
      ['admin', 'gerente'].includes(profile.role),
    
    canCancelOrder: () => 
      ['admin', 'gerente'].includes(profile.role),
    
    canSeeAllOrders: () => 
      ['admin', 'gerente', 'programador'].includes(profile.role),
    
    isOperator: () => 
      profile.role === 'operador',
    
    isFinishing: () => 
      profile.role === 'acabamento',
      
    isAdmin: () => 
      profile.role === 'admin'
  };
};
