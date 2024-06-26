---
title: API changelog
---

# Breaking changes to the API interface

## Metabase 0.50.0

- `/api/metric`

   The `/api/metric` endpoints has been renamed to `/api/legacy-metric` to reflect that fact it will not be used for the new version of metrics. The new version uses the `/api/card` endpoints.

- `GET /api/permissions/graph` and `PUT /api/permissions/graph`

   The `data` key has been removed from the permissions graph. It has been replaced with `view-data` and `create-queries`.
   Valid permission values for `view-data` are `unrestricted`, `blocked`, `sandboxed` or `restricted`. Valid permission values
   for `create-queries` are `query-builder-and-native`, `query-builder`, and `no`.

- `GET /api/transform/:db-id/:schema/:transform-name`, which hasn't been used internally by Metabase for ages, has
  been removed.

## Metabase 0.49.0
- `POST /api/card` and `PUT /api/card/:id`

   The `dataset` key is deprecated and will be removed in a future version, most likely 50. In its place we have added a new key: `type` which is equivalent in that it distinguishes Models from Questions. `type="model"` is equivalent to `dataset=true` and `type="question"` is equivalent to `dataset=false`.

- all endpoints that return data (e.g. exports in JSON, XLSX, CSV, endpoints that end in "/query")

   Starting from v49, we respond to the API calls with values formatted according to the instance localization options

# Additions to the API interface

## Metabase 0.49.5
NOTE: These endpoint changes were added in 0.49.3, and a bug in `GET /api/embed/card/:token/query/:export-format` was fixed in 0.49.5.

- `POST /api/card/:card-id/query/:export-format`
- `POST /api/:dashboard-id/dashcard/:dashcard-id/card/:card-id/query/:export-format`
- `POST /api/dataset/:export-format`
- `GET /api/embed/card/:token/query/:export-format`
- `GET /api/embed/dashboard/:token/dashcard/:dashcard-id/card/:card-id/:export-format`

    The above endpoints now accept the `format_rows` query parameter. It is an optional boolean parameter that will default to `true` if not included in the request.
    When `format_rows` is `true`, the export will have formatting applied such that the values match what they appear as in the app.
    When `format_rows` is `false`, formatting is not applied and exports will behave as they did prior to 0.49.0.

    The value of `format_rows` has no effect when exporting xlsx files.
