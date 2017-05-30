# Routes

## Users

- `GET /signup`
- `POST /signup`
- `GET /login`
- `POST /login`
- `GET /profile`
- `GET /edit-profile`
- `GET /logout`

## Collections

- `GET /collections`
- `POST /collections`
- `GET /collections/:id`
- `DELETE /collections/:id`

## Feeds

- `GET /feeds`
- `POST /feeds`
- `GET /feeds/:id`
- `DELETE /feeds/:id`
- `GET /collections/:collection_id/feeds`

## Articles

- `GET /articles`
  - articles index/search
  - accepts 'tag_name' query param
- `POST /articles`
- `GET /articles/:id`
- `GET /feeds/:feed_id/articles`

## tags

- `GET /tags`
- `POST /feeds/:feed_id/tags`
- `DELETE /feeds/:feed_id/tags/:tag_name`
