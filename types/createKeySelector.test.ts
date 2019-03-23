import { createKeySelector } from "redux-views";
import { PropsA, PropsB } from "./test.types";

// $ExpectType ParametricInstanceSelector<{}, PropsA, string>
export const contactIdSelector = createKeySelector(({ contactId }: PropsA) => contactId);

// $ExpectType ParametricInstanceSelector<{}, PropsB, string>
export const companyIdSelector = createKeySelector<PropsB>(({ companyId }) => companyId);
