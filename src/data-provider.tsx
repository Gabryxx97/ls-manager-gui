/* eslint-disable @typescript-eslint/no-explicit-any */
import { DataProvider, Identifier } from "react-admin";
import { apiUrl, httpRequest, JsonResponse } from "./http-client";

const listUrl = (
  resource: string,
  pagination: { page: number; perPage: number },
  filter: Record<string, unknown> = {},
  sort?: { field: string; order: string },
) => {
  const normalizedFilter = Object.fromEntries(
    Object.entries(filter)
      .filter(([, value]) => value !== undefined && value !== null && value !== "")
      .map(([field, value]) => [
        field,
        { operator: field === "search" ? "ILIKE" : "EQUAL", values: [value] },
      ]),
  );
  const query = new URLSearchParams({
    page: String(pagination.page),
    pageSize: String(pagination.perPage),
  });
  if (Object.keys(normalizedFilter).length) {
    query.set("filter", JSON.stringify(normalizedFilter));
  }
  if (sort) query.set("sort", JSON.stringify({ [sort.field]: sort.order }));
  return `${apiUrl}/${resource}?${query}`;
};

const totalFrom = (headers: Headers) => {
  const range = headers.get("Content-Range");
  if (!range) throw new Error("La risposta non contiene l'header Content-Range");
  const value = range.includes("/") ? range.slice(range.lastIndexOf("/") + 1) : range;
  const total = Number(value);
  if (!Number.isSafeInteger(total) || total < 0) {
    throw new Error("L'header Content-Range non è valido");
  }
  return total;
};

const listResponse = ({ json, headers }: JsonResponse<any[]>) => ({
  data: json,
  total: totalFrom(headers),
});

export const dataProvider: DataProvider = {
  getList: (resource, params) =>
    httpRequest<any[]>(
      listUrl(resource, params.pagination ?? { page: 1, perPage: 25 }, params.filter, params.sort),
    ).then(listResponse),

  getOne: (resource, params) =>
    httpRequest<any>(`${apiUrl}/${resource}/${params.id}`).then(({ json }) => ({ data: json })),

  getMany: (resource, params) => {
    const query = new URLSearchParams({
      page: "1",
      pageSize: "100",
      filter: JSON.stringify({ id: { operator: "IN", values: params.ids } }),
    });
    return httpRequest<any[]>(`${apiUrl}/${resource}?${query}`).then(({ json }) => ({ data: json }));
  },

  getManyReference: (resource, params) =>
    httpRequest<any[]>(
      listUrl(
        resource,
        params.pagination,
        { [params.target]: params.id, ...params.filter },
        params.sort,
      ),
    ).then(listResponse),

  create: (resource, params) =>
    httpRequest<any>(`${apiUrl}/${resource}`, {
      method: "POST",
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({ data: json })),

  update: (resource, params) =>
    httpRequest<any>(`${apiUrl}/${resource}/${params.id}`, {
      method: "PUT",
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({ data: json })),

  updateMany: (resource, params) =>
    Promise.all(
      params.ids.map((id: Identifier) =>
        httpRequest(`${apiUrl}/${resource}/${id}`, {
          method: "PUT",
          body: JSON.stringify(params.data),
        }),
      ),
    ).then(() => ({ data: params.ids })),

  delete: (resource, params) =>
    httpRequest<any>(`${apiUrl}/${resource}/${params.id}`, { method: "DELETE" }).then(
      ({ json }) => ({ data: json ?? params.previousData ?? { id: params.id } }),
    ),

  deleteMany: (resource, params) =>
    Promise.all(
      params.ids.map((id: Identifier) =>
        httpRequest(`${apiUrl}/${resource}/${id}`, { method: "DELETE" }),
      ),
    ).then(() => ({ data: params.ids })),
};
