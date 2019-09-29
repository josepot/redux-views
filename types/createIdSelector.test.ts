import { createIdSelector } from "redux-views";
import { PropsA, PropsB } from "./test.types";

// $ExpectType ParametricSelector<{}, PropsA, string>
export const contactIdSelector = createIdSelector(({ contactId }: PropsA) => contactId);

// $ExpectType ParametricSelector<{}, PropsB, string>
export const companyIdSelector = createIdSelector<PropsB>(({ companyId }) => companyId);
