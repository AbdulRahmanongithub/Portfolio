# Abdul Rahman A — Portfolio

Personal portfolio site for Abdul Rahman A (Full-Stack .NET & Angular Developer). Static HTML/CSS/JS, no
build step, no framework — deployed as plain files.

## Structure

```
index.html              Single-page site — all sections (About, Skills, Experience, Projects, Freelance, Education, Contact)
assets/
  css/style.css          Theme: glassmorphism dark UI, gradient mesh background, glass cards, timeline, bento project grid
  js/script.js           Scroll-spy nav, scroll progress bar, back-to-top, hero role rotator, mobile menu, EmailJS contact form + success modal
  profile.jpg            About-section photo
  Resume.pdf             Downloadable resume (linked from nav + hero)
```

No dependencies, no package.json — open `index.html` directly or serve the folder with any static file server.

## Audience-filtering query string

The site shows a different version of itself depending on who's opening the link, controlled entirely
by a `?show=` query string (no build variants, one HTML file):

| URL | Who it's for | Behavior |
|---|---|---|
| `index.html` (no param) | Recruiters / full-time hiring | **Default.** Freelance section, its nav link, and all freelance-flavored copy (badges, hero line, About paragraph) are hidden. |
| `index.html?show=freelance` | Freelance clients | Freelance section shown, nav link highlighted, "Tailored for you" badge on the section heading. |
| `index.html?show=all` | General / neutral link | Everything shown, no extra emphasis. |

**Why:** some recruiters hesitate to hire someone who also freelances (reads as "not committed to full-time"),
while some freelance clients want to see someone dedicated to freelance work rather than moonlighting. Rather
than maintaining two separate pages, one file quietly adapts based on which link was shared.

**How it works:** a small inline `<script>` at the very top of `<head>` reads `location.search` synchronously
and adds `show-freelance` or `show-all` as a class on `<html>` *before* the body paints — so there's no flash of
freelance content on the recruiter-safe default. CSS then does all the hiding/showing via two utility class pairs:

- `.fl-block` / `.fl-inline` — hidden by default, revealed under `.show-freelance` or `.show-all`
- `.dfl-block` / `.dfl-inline` — visible by default, hidden under `.show-freelance` or `.show-all`

Elements carrying both a default and freelance-flavored version of the same copy exist as sibling elements,
one tagged `dfl-*`, one tagged `fl-*`. See `assets/css/style.css` (search `show-freelance`) and `index.html`
(search `fl-block`/`fl-inline`/`dfl-block`/`dfl-inline`) to extend this to new sections.

## Editing content

Everything is hand-authored in `index.html` — no CMS, no data file. Project cards live in `#projects` and
`#freelance`; each is a `.project-card.glass` block with a `.project-visual` (browser-chrome mockup showing
the live URL), title, description, `.project-tech` chips, and an optional `.project-link` to the live site.

## Contact form

Uses [EmailJS](https://www.emailjs.com/) (`assets/js/script.js`) — the public key, service ID, and template
ID are embedded client-side by design (EmailJS keys are meant to be public; sending is rate-limited and
domain-restricted on their dashboard, not by hiding the key).

## Deployment

This repo (`AbdulRahmanongithub/Portfolio`) is the source of truth. The site is manually kept in sync with
a local "live" copy — after editing here, mirror `index.html` and `assets/` to the deployed location and
push this repo so GitHub stays current.
