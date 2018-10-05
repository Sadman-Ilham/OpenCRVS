import { findCompositionSection } from 'src/features/fhir/utils'
import {
  MOTHER_CODE,
  FATHER_CODE,
  CHILD_CODE
} from 'src/features/fhir/templates'
import fetch from 'node-fetch'
import { fhirUrl } from 'src/constants'

export const typeResolvers = {
  HumanName: {
    givenName(name: any) {
      return name.given
    },
    familyName(name: any) {
      return name.family
    }
  },

  Person: {
    /* `gender` and `name` resolvers are trivial resolvers, so they don't need implementation */
  },

  BirthRegistration: {
    createdAt(composition: any) {
      return composition.date
    },
    async mother(composition: any) {
      const patientSection = findCompositionSection(MOTHER_CODE, composition)
      const res = await fetch(`${fhirUrl}/${patientSection.entry[0].reference}`)
      return res.json()
    },
    async father(composition: any) {
      const patientSection = findCompositionSection(FATHER_CODE, composition)
      const res = await fetch(`${fhirUrl}/${patientSection.entry[0].reference}`)
      return res.json()
    },
    async child(composition: any) {
      const patientSection = findCompositionSection(CHILD_CODE, composition)
      const res = await fetch(`${fhirUrl}/${patientSection.entry[0].reference}`)
      return res.json()
    }
  }
}
