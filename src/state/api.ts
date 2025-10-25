import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query";

export const api = createApi({
    baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api" }),
    reducerPath: "api",
    tagTypes: [],
    endpoints: (build) => ({}),
});

export const {} = api;