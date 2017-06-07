# Database Schema

## users
column name     | data type | details
----------------|-----------|-----------------------
id              | Number    | not null, primary key
name            | String    | not null
email           | String    | not null
username        | String    | not null
password_digest | String    | not null
avatar_url      | String    |

## collections
column name     | data type | details
----------------|-----------|-----------------------
id              | Number    | not null, primary key
title           | String    | not null
user_id         | Objectid  | not null (references users)

## feeds
column name     | data type | details
----------------|-----------|-----------------------
id              | Number    | not null, primary key
xml_url         | String    | not null
title           | String    | not null
link            | String    |
description     | String    |
image_url       | String    |

## subscriptions
column name     | data type | details
----------------|-----------|-----------------------
id              | Number    | not null, primary key
collection_id   | Objectid  | not null (references collections)
feed_id         | Objectid  | not null (references feeds)

## articles
column name     | data type | details
----------------|-----------|-----------------------
id              | Number    | not null, primary key
title           | String    | not null
author          | String    |
content         | String    | not null
date_published  | Date      | not null
link            | String    | not null

## bookmarks
column name     | data type | details
----------------|-----------|-----------------------
id              | Number    | not null, primary key
user_id         | Objectid  | not null (references users)
article_id      | Objectid  | not null (references articles)

## tags
column name     | data type | details
----------------|-----------|-----------------------
id              | Number    | not null, primary key
name            | String    | not null

## taggings
column name     | data type | details
----------------|-----------|-----------------------
id              | Number    | not null, primary key
feed_id         | Objectid  | not null (references feeds)
tag_id          | Objectid  | not null (references tags)
