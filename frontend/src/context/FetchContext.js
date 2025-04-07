import { useDoctorLinks,useAdminLinks,useResearcherLinks } from './Context';
import {useRole} from "./roleContext";

export const useRoleLinks = () => {
    const { role } = useRole(); // Get the role from context
    const { links: doctorLinks } = useDoctorLinks();
    const { links: researcherLinks } = useResearcherLinks();
    const { links: adminLinks } = useAdminLinks();
  
    // Determine which links to return based on the role
    switch (role) {
      case 'Admin':
        return {links:adminLinks};
      case 'Researcher':
        return {links:researcherLinks};
      case 'Doctor':
        return {links:doctorLinks};
      default:
        return [];
    }
  };

