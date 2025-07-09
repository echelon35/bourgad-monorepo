import { OrganisationType } from "./organisation_type.model";

export interface Organisation {
    organisationId: number;
    name: string;
    siret_siren: string;
    adress: string;
    phone?: string;
    mail: string;
    website?: string;
    organisationtypeId: number;
    hours: JSON;

    organisationType: OrganisationType;
}