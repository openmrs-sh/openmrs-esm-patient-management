import { openmrsFetch, useConfig } from '@openmrs/esm-framework';
import useSWRImmutable from 'swr/immutable';
import { ConfigObject } from '../../config-schema';
import { Patient, Attribute } from '../../types';

const customRepresentation =
  'custom:(uuid,display,identifiers:(identifier,uuid,preferred,location:(uuid,name),identifierType:(uuid,name,format,formatDescription,validator)),person:(uuid,display,gender,birthdate,dead,age,deathDate,birthdateEstimated,causeOfDeath,preferredName:(uuid,preferred,givenName,middleName,familyName),attributes,preferredAddress:(uuid,preferred,address1,address2,cityVillage,longitude,stateProvince,latitude,country,postalCode,countyDistrict,address3,address4,address5,address6,address7)))';

/**
 *  React hook that takes a patientUuid and returns patient attributes {@link Attribute}
 * @param patientUuid Unique patient identifier
 * @returns An object containing patient attributes, an `isLoading` boolean and an `error` object
 */
export const usePatientAttributes = (patientUuid: string) => {
  const { data, error, isLoading } = useSWRImmutable<{ data: Patient }>(
    `/ws/rest/v1/patient/${patientUuid}?v=${customRepresentation}`,
    openmrsFetch,
  );

  return {
    isLoading,
    attributes: data?.data.person.attributes ?? [],
    error: error,
  };
};
/**
 *  React hook that takes patientUuid {@link string} and return contact details
 *  derived from patient-attributes using configured attributeTypes
 * @param patientUuid Unique patient identifier {@type string}
 * @returns Object containing `contactAttribute` {@link Attribute} loading status
 */
export const usePatientContactAttributes = (patientUuid: string) => {
  const { contactAttributeType } = useConfig() as ConfigObject;
  const { attributes, isLoading } = usePatientAttributes(patientUuid);
  const contactAttributes = attributes.filter(({ attributeType }) =>
    contactAttributeType?.some((uuid) => attributeType.uuid === uuid),
  );
  return {
    contactAttributes: contactAttributes ?? [],
    isLoading,
  };
};
