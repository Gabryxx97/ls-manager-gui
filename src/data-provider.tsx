/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  GET_LIST,
  GET_ONE,
  GET_MANY,
  GET_MANY_REFERENCE,
  CREATE,
  UPDATE,
  DELETE,
  DataProvider,
  Identifier,
} from "react-admin";

const apiUrl = import.meta.env.VITE_BACKEND_URL + "/api";

export async function fetchWithRefresh(
  url: string,
  opts: RequestInit = {},
): Promise<Response> {
  opts.credentials = "include";
  let res = await fetch(url, opts);
  if (res.status === 401) {
    const refreshRes = await fetch(`${apiUrl}/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (refreshRes.ok) {
      res = await fetch(url, opts);
    } else {
      const err: any = new Error(
        refreshRes.statusText || `HTTP ${refreshRes.status}`,
      );
      err.status = refreshRes.status;
      throw err;
    }
  }
  return res;
}

const responseToData = async (res: Response) => {
  const text = await res.text();
  let json: any;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = {};
  }
  return { status: res.status, headers: res.headers, body: text, json };
};

const customFetchJson = (url: string, options: any = {}) =>
  fetchWithRefresh(url, options).then(responseToData);

const authHttpClient = (url: string, options: any = {}) => {
  options.credentials = "include";
  options.headers =
    options.headers || new Headers({ Accept: "application/json" });

  const csrf = document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1];
  if (csrf) {
    options.headers.set("X-XSRF-TOKEN", csrf);
  }
  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !options.headers.has("Content-Type")
  ) {
    options.headers.set("Content-Type", "application/json");
  }
  return customFetchJson(url, options);
};

/** Costruisce URL e options per ciascuna operazione */
const convertDataRequestToHTTP = (
  type: string,
  resource: string,
  params: any,
) => {
  let url = "";
  const options: any = {};

  switch (type) {
    case GET_LIST: {
      options.method = "GET";
      const { page, perPage } = params.pagination;

      // Filter
      const filter: Record<string, any> = {};
      if (params.filter) {
        for (const key in params.filter) {
          filter[key] = {
            operator: key === "search" ? "ILIKE" : "EQUAL",
            values: [params.filter[key]],
          };
        }
      }
      const encodedFilter = encodeURIComponent(JSON.stringify(filter));

      // Sort
      let encodedSort = "";
      if (params.sort) {
        const sortObj: Record<string, string> = {};
        sortObj[params.sort.field] = params.sort.order;
        encodedSort = encodeURIComponent(JSON.stringify(sortObj));
      }

      url =
        `${apiUrl}/${resource}` +
        `?page=${page}&pageSize=${perPage}` +
        (encodedFilter ? `&filter=${encodedFilter}` : "") +
        (encodedSort ? `&sort=${encodedSort}` : "");
      break;
    }

    case GET_ONE: {
      options.method = "GET";
      url = `${apiUrl}/${resource}/${params.id}`;
      break;
    }

    case GET_MANY: {
      options.method = "GET";
      const filter = { ids: { operator: "IN", values: params.ids } };
      const encodedFilter = encodeURIComponent(JSON.stringify(filter));
      url =
        `${apiUrl}/${resource}` +
        `?filter=${encodedFilter}` +
        `&page=1&pageSize=100`;
      break;
    }

    case GET_MANY_REFERENCE: {
      options.method = "GET";
      const { page, perPage } = params.pagination;
      const filter: Record<string, any> = {
        [params.target]: { operator: "EQUAL", values: [params.id] },
      };
      const encodedFilter = encodeURIComponent(JSON.stringify(filter));

      let encodedSort = "";
      if (params.sort) {
        const sortObj: Record<string, string> = {};
        sortObj[params.sort.field] = params.sort.order;
        encodedSort = encodeURIComponent(JSON.stringify(sortObj));
      }

      url =
        `${apiUrl}/${resource}` +
        `?filter=${encodedFilter}` +
        `&page=${page}&pageSize=${perPage}` +
        (encodedSort ? `&sort=${encodedSort}` : "");
      break;
    }

    case CREATE: {
      options.method = "POST";
      options.body = JSON.stringify(params.data);
      url = `${apiUrl}/${resource}`;
      break;
    }

    case UPDATE: {
      options.method = "PUT";
      options.body = JSON.stringify(params.data);
      url = `${apiUrl}/${resource}/${params.id}`;
      break;
    }

    case DELETE: {
      options.method = "DELETE";
      url = `${apiUrl}/${resource}/${params.id}`;
      break;
    }

    default:
      throw new Error(`Unsupported fetch action type ${type}`);
  }

  return { url, options };
};

/** Converte la risposta HTTP in formato react-admin */
const convertHTTPResponse = (
  response: any,
  type: string,
  _resource: string,
  params: any,
) => {
  // ► Gestione immediata dei 4xx
  if (response.status >= 400) {
    throw new Error(response.statusText || `HTTP ${response.status}`);
  }

  const { headers, json } = response;
  switch (type) {
    case GET_LIST:
    case GET_MANY_REFERENCE: {
      const range = headers.get("Content-Range");
      if (!range) {
        throw new Error("Content-Range header is missing in the response.");
      }
      return { data: json, total: parseInt(range, 10) };
    }
    case CREATE:
      return {
        data: { ...params.data, id: json.id ? json.id : 1, response: json },
      };
    default:
      return { data: json };
  }
};

/** DataProvider per react-admin */
export const dataProvider: DataProvider = {
  getList: (resource, params) => {
    const { url, options } = convertDataRequestToHTTP(
      GET_LIST,
      resource,
      params,
    );
    return authHttpClient(url, options).then((r) =>
      convertHTTPResponse(r, GET_LIST, resource, params),
    );
  },
  getOne: (resource, params) => {
    const { url, options } = convertDataRequestToHTTP(
      GET_ONE,
      resource,
      params,
    );
    return authHttpClient(url, options).then((r) =>
      convertHTTPResponse(r, GET_ONE, resource, params),
    );
  },
  getMany: (resource, params) => {
    const { url, options } = convertDataRequestToHTTP(
      GET_MANY,
      resource,
      params,
    );
    return authHttpClient(url, options).then((r) =>
      convertHTTPResponse(r, GET_MANY, resource, params),
    );
  },
  getManyReference: (resource, params) => {
    const { url, options } = convertDataRequestToHTTP(
      GET_MANY_REFERENCE,
      resource,
      params,
    );
    return authHttpClient(url, options).then((r) =>
      convertHTTPResponse(r, GET_MANY_REFERENCE, resource, params),
    );
  },
  create: (resource, params) => {
    const { url, options } = convertDataRequestToHTTP(CREATE, resource, params);
    return authHttpClient(url, options).then((r) =>
      convertHTTPResponse(r, CREATE, resource, params),
    );
  },
  update: (resource, params) => {
    const { url, options } = convertDataRequestToHTTP(UPDATE, resource, params);
    return authHttpClient(url, options).then((r) =>
      convertHTTPResponse(r, UPDATE, resource, params),
    );
  },
  updateMany: (resource, params) =>
    Promise.all(
      params.ids.map((id: Identifier) =>
        authHttpClient(`${apiUrl}/${resource}/${id}`, {
          method: "PUT",
          body: JSON.stringify(params.data),
        }),
      ),
    ).then((responses) => ({ data: responses.map((r) => r.json) })),
  delete: (resource, params) => {
    const { url, options } = convertDataRequestToHTTP(DELETE, resource, params);
    return authHttpClient(url, options).then((r) =>
      convertHTTPResponse(r, DELETE, resource, params),
    );
  },
  deleteMany: (resource, params) =>
    Promise.all(
      params.ids.map((id: Identifier) =>
        authHttpClient(`${apiUrl}/${resource}/${id}`, { method: "DELETE" }),
      ),
    ).then((responses) => ({ data: responses.map((r) => r.json) })),
};
