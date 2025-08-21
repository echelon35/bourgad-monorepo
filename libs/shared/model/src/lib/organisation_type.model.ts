import { Organisation } from "./organisation.model";

export interface OrganisationType {
    organisationtypeId: number;
    name: string;
    description: string;
    organisations?: Organisation[]; // Assuming Organisation is defined elsewhere
}