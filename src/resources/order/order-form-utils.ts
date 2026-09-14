import { FieldValues } from "react-hook-form";

export type OrderFormDetail = {
  articleId?: number;
  quantity?: number;
};

export type OrderFormData = {
  workOrderId?: number;
  date?: string;
  priority?: string;
  status?: string;
  details?: OrderFormDetail[];
};

export const sanitizeOrder = (data: OrderFormData) => ({
  workOrderId: data.workOrderId,
  date: data.date,
  priority: data.priority,
  status: data.status,
  details: (data.details ?? []).map(({ articleId, quantity }) => ({
    articleId,
    quantity,
  })),
});

export const validateOrderForm = (values: FieldValues) => {
  const errors: Record<string, unknown> = {};

  if (values.workOrderId == null) errors.workOrderId = "La commessa è obbligatoria";
  if (!values.date) errors.date = "La data è obbligatoria";
  if (!values.priority) errors.priority = "La priorità è obbligatoria";
  if (!values.status) errors.status = "Lo stato è obbligatorio";

  const details = Array.isArray(values.details)
    ? (values.details as OrderFormDetail[])
    : [];
  if (details.length === 0) {
    errors.details = "L'ordine deve contenere almeno una riga";
    return errors;
  }

  const occurrences = new Map<number, number>();
  details.forEach((detail) => {
    if (detail?.articleId != null) {
      occurrences.set(detail.articleId, (occurrences.get(detail.articleId) ?? 0) + 1);
    }
  });

  errors.details = details.map((detail) => {
    const detailErrors: Record<string, string> = {};
    if (detail?.articleId == null) {
      detailErrors.articleId = "L'articolo è obbligatorio";
    } else if ((occurrences.get(detail.articleId) ?? 0) > 1) {
      detailErrors.articleId = "L'articolo è già presente nell'ordine";
    }
    if (detail?.quantity == null) {
      detailErrors.quantity = "La quantità è obbligatoria";
    } else if (!Number.isInteger(Number(detail.quantity)) || Number(detail.quantity) <= 0) {
      detailErrors.quantity = "La quantità deve essere un intero maggiore di zero";
    }
    return detailErrors;
  });

  return errors;
};
