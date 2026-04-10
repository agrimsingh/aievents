---
title: Featured event date layout
category: improvement
createdAt: 2026-04-10T12:00:00.000Z
---

The featured event hero aligns the large day numeral and month label on one row using vertical centering and matching line heights, so mixed font sizes no longer look vertically off.

The extra weekday line under the month is removed because the formatted range on the next line already includes weekday and time.

`formatDateParts` now returns only `day` and `month`, dropping unused weekday formatting.
