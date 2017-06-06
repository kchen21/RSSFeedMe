# Database Schema

## users
column name     | data type | details
----------------|-----------|-----------------------
id              | integer   | not null, primary key
name            | string    | not null
email           | string    | not null
username        | string    | not null
password_digest | string    | not null
avatar_url      | string    |

## collections
column name     | data type | details
----------------|-----------|-----------------------
id              | integer   | not null, primary key
title           | string    | not null
user_id         | integer   | not null (references users)

## feeds
column name     | data type | details
----------------|-----------|-----------------------
id              | integer   | not null, primary key
url             | string    | not null
title           | string    | not null
description     | string    |

## subscriptions
column name     | data type | details
----------------|-----------|-----------------------
id              | integer   | not null, primary key
collection_id   | integer   | not null (references collections)
feed_id         | integer   | not null (references feeds)

## articles
column name     | data type | details
----------------|-----------|-----------------------
id              | integer   | not null, primary key
title           | string    | not null
author          | string    |
content         | string    | not null
date_published  | date      | not null
link            | string    | not null

## bookmarks
column name     | data type | details
----------------|-----------|-----------------------
id              | integer   | not null, primary key
user_id         | integer   | not null (references users)
article_id      | integer   | not null (references articles)

## tags
column name     | data type | details
----------------|-----------|-----------------------
id              | integer   | not null, primary key
name            | string    | not null

## taggings
column name     | data type | details
----------------|-----------|-----------------------
id              | integer   | not null, primary key
feed_id         | integer   | not null (references feeds)
tag_id          | integer   | not null (references tags)
