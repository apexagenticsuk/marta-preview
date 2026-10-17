# Content audit: kidsshow.ie (Magic Marta)

Audit of the live Wix site https://www.kidsshow.ie, taken on 17 Oct 2026 from public pages only (no log-in, nothing submitted).
Raw captures are in `docs/source/` (page text, link lists, post text, review screenshots). Every image came from Marta's own public Wix media and is listed in `docs/SOURCES.md`.

## How the live site is built

The live site is a one-page Wix site. `/about`, `/gallery`, `/contact` and `/testimonials` return 404; they are sections (anchors) of the home page. The only real second page is the blog, `/blog`, called **What's Up?**. There is also a stale template page `/editor` ("Marta's Magic Online Show, Available Now" with an alphabet grid and an old phone number). It is not linked from the menu and is not rebuilt.

Menu on the live site: Home, About, Gallery, Contact, Testimonials, What's Up?.

## Pages in the rebuild (one purpose each)

| Page | Live source | Content |
|---|---|---|
| Home | home hero, "Weddings/Communion" cards intro, video, "What They Say" | Welcome and hero line, the occasions Marta covers (8 services), the home video, 3 reviews, call/text/enquire band |
| About | "About" section, Face painting, Balloon modelling, Weddings, Communion sections, CLIENTS | Intro, what Marta does (4 live texts), awards/press, 17 client logos |
| Gallery | "Gallery" section (three Wix collage frames) and the two YouTube posts | 18 photos, 3 videos |
| Testimonials | "What They Say" slider | All 17 reviews |
| What's Up? | `/blog` | All 36 posts, newest first |
| Contact | "GET IN TOUCH" section | Enquiry form (mailto), phone, email, area |

## Contact details (exact, from the live footer and contact section)

- Phone: **087-2616-317** (also shown as `0872616317` in the tel: link). Used for "Call" (`tel:+353872616317`) and "Text" (`sms:+353872616317`).
- Email: **info@martasmagic.com**
- Area: Co. Dublin. Company line: Marta's Magic Kids Show.
- Website name: kidsshow.ie

### Conflicts found on the live site (decisions)

| Where | What the live site says | Decision |
|---|---|---|
| Home meta description, 2 old posts, flyer images | Old number **085 166 6125** (written 0851666125, 0851-666-125, 085-1666-125) | Not used. The current number is used everywhere. In post text the old number is replaced by the live phone token, so it is always the current number. |
| Wix contact form target | The form's own address is hidden; the "BOOK NOW" button uses `mailto:INFO@KIDSSHOW.IE`, the footer uses `mailto:magickidsshow@gmail.com?subject=Enquiry` and `mailto:info@kidsshow.ie?subject=Hey%20Marta!`, the visible text says `info@martasmagic.com` | Use the visible address **info@martasmagic.com**. The form opens the visitor's email app addressed to it (no backend invented). Flag for Marta to confirm which inbox she reads. |
| Facebook | `http://www.facebook.com/kidsshow` and `https://www.facebook.com/KidsShow/` | `https://www.facebook.com/kidsshow` (https, same page) |
| Twitter | `http://www.twitter.com/martasmagic` | `https://twitter.com/martasmagic` |
| LinkedIn | `http://ie.linkedin.com/in/martasmagic/` and `https://www.linkedin.com/in/martasmagic/` | `https://www.linkedin.com/in/martasmagic/` |
| Instagram | `https://www.instagram.com/magiciandublin` / `instagram.com/MAGICIANDUBLIN` | `https://www.instagram.com/magiciandublin` |

## Social links (6, exact handles)

| Network | Handle | URL used |
|---|---|---|
| Facebook | kidsshow | https://www.facebook.com/kidsshow |
| Instagram | magiciandublin | https://www.instagram.com/magiciandublin |
| YouTube | magiciandublin | https://www.youtube.com/user/magiciandublin |
| TikTok | magiciandublin | https://www.tiktok.com/@magiciandublin |
| Twitter | martasmagic | https://twitter.com/martasmagic |
| LinkedIn | martasmagic | https://www.linkedin.com/in/martasmagic/ |

## Booking / payment

The live site has **no online booking or payment**. The call to action is the phone number and a contact form (plus a "BOOK NOW" mailto button). The rebuild does the same: Call, Text and a mailto enquiry form with the live fields (Name, Email, Phone, Location, Date of your event, Message). Nothing was invented.

## Services (8, as listed in the brief; titles from the live text)

Birthday parties, Communions, Christenings, Weddings, Corporate events, Christmas parties, Festivals, Shopping centres (the live text says "In-store promotions" and "Festivals"). The live site gives no separate description for each, so the cards carry a title only. The four texts the live site does have (Face painting, Balloon modelling, Weddings, Communion) are on the About page word for word.

## Reviews (17)

Claire (Woodstown Dental Centre), George (The Square Tallaght), Judy (Axis Insurance), Bernie (Christ Church Cathedral), Michelle (Tinahely Festival), Mia (Steam Museum), Ann (Bumblebee Montessori & Childcare), Dennis (Newlands Golf Club), Tim (The National Yacht Club), Caroline (St. Michaels House), Cecilie (Cocoon Childcare), Phillip (SuperValu), Jane (Druids Glen), Bob (Durcans), Michael (Ana Liffey Drug Project), Lynn (Liffey Valley), Marlene (Vodafone).

Each live slide also shows the reviewer's company logo. Those 17 logos were not copied (several are third-party marks; the company name is already in the review).

## Gallery, videos, awards, logos

- **Photos:** 18 (all of the photos in the three Wix gallery frames that could be downloaded).
- **Videos:** 3 on YouTube: `mTJYoEMKo8o` (home video), `UevRhQEmBcc` ("Add a little magic...", blog post 16 Oct 2019), `oWKJjb4UorU` ("Make your kids party fun & memorable", blog post 24 Jan 2017). Thumbnails are self-hosted; YouTube loads only after a visitor presses play.
- **Awards / press:** Mrs2be.ie Bride's Choice Awards 2015 (nominated for the second year running; blog post 2 Mar 2015); featured in the Weddings Online blog "Alternative Entertainment" (blog post 7 Mar 2024). The live text calls Marta an "award-winning magician" but names no award, so none is invented.
- **Clients ("as featured in") logos:** 17 captured: IKEA, Bank of Ireland, Citibank, J.P. Morgan, Tesco, Web Summit, Harvey Norman, BMW, SuperValu, Coca-Cola, Flying Tiger, Cystic Fibrosis Ireland, Matheson, Lidl, Salesforce, Fitbit, Vodafone.

## Blog (What's Up?): 36 posts, 12 Sep 2024 back to 23 Dec 2014

Titles, dates, authors and full text are in `content.json`. Authors: Magic Marta (34), Weddings Online (1), Hamish Urquhart (1, the "Get to know Magic Marta" interview). Post 32 "One thing every wedding needs!" is about another performer's website. It is kept as text but its links are removed (no links to other sites that are not Marta's). Links in posts to third-party shops and pages are shown as plain words, apart from the one Weddings Online article link in the "Alternative Entertainment" post.

## Flagged: not readable, not copied, or changed on purpose

1. **Reviews slider text** is not in the page HTML (Wix loads it lazily). It was captured by screenshots and typed out; spellings from the live site are kept as written (for example "appoinment", "definately", "affraid"). Re-check against the live slider before launch.
2. **Clients carousel**: only the logos that were visible and downloadable were captured (17). The live carousel also shows more logos (for example Ellucian, Zalando, B&Q, Musgrave MarketPlace, Ardmore Studios, Kepak, Paul, Peugeot); they could not all be read or downloaded, so they are not claimed.
3. **Instagram feed** on the home page (a live widget with captions) was not copied; the Instagram link is in the social icons.
4. **Background video** on the live home page (`11062b_03c50f8f...mp4`) was not copied (large, and decorative).
5. **Wix contact form** backend is not visible (see the conflicts table).
6. **Baked-text banner images** (home hero banner, "Magical About Me", "Meet Marta") contain text inside the picture. They are not used; the same words are real text on the page.
7. **Old phone number inside images:** 4 old blog images show 085 166 6125 (posts "Good news!", "Happy Halloween", "Super Sundays is back!", "Super Sundays!"). Those four images are left out; the posts keep their text.
8. **Post images that could not be described from the picture alone** have a short description from looking at them; please correct any that are wrong in the editor.
9. **Post 24 ("Entertainer for Your event")** has 4 pictures on the live site; the first is used.
10. **Old offers:** the blog is dated, and a few old posts mention discounts (for example "Super Sundays 25% discount", "20% off in January 2017"). They are kept as history with their dates, but they are not current offers.
11. **Page `/editor`** (stale Online Show page) is not rebuilt.

## Counts

6 pages, 8 services, 17 reviews, 17 client logos, 18 gallery photos, 3 videos, 36 posts, 2 awards/press items, 6 social links, 6 menu items.
