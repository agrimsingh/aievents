import type { EventKind, EventRecord } from "@/lib/types";

/** Snapshot when server-side fetch cannot read the page (e.g. bot interstitial). */
export type CuratedEventFallback = Pick<
  EventRecord,
  "title" | "description" | "date" | "location"
> &
  Pick<Partial<EventRecord>, "endDate" | "coverImage">;

/** Curated event page URLs (Luma or other hosts with Event JSON-LD). */
export type CuratedEventEntry = {
  sourceUrl: string;
  type?: EventKind;
  tags?: string[];
  scrapeFallback?: CuratedEventFallback;
};

export const curatedEvents: CuratedEventEntry[] = [
  {
    sourceUrl: "https://luma.com/srcfgry1",
    type: "hackathon",
    tags: ["Grab", "65labs", "API"],
  },
  {
    sourceUrl: "https://luma.com/fhdzsqfd",
    type: "meetup",
    tags: ["Codex", "agents"],
  },
  {
    sourceUrl: "https://luma.com/bh5iqhnx",
    type: "hackathon",
    tags: ["Vercel"],
  },

  // Road to AI Engineer Singapore (see luma.com/1eofvp02 for full list)
  {
    sourceUrl: "https://luma.com/00hm86ph",
    type: "meetup",
    tags: ["Road to AIE", "OpenAI"],
  },
  {
    sourceUrl: "https://luma.com/7die021j",
    type: "meetup",
    tags: ["Road to AIE", "Magic Patterns"],
  },
  {
    sourceUrl: "https://luma.com/w1gfp1g3",
    type: "meetup",
    tags: ["Road to AIE", "Adaption", "Lorong AI", "AI Singapore"],
    scrapeFallback: {
      title:
        "Adaption X Singapore, Hosted by Adaption, Lorong AI & AI Singapore",
      description:
        "Join us for an evening at Lorong AI (at One North) where we dig into the question at the center of AI's next chapter: how do we build systems that continuously…",
      date: "2026-05-18T10:30:00.000Z",
      endDate: "2026-05-18T13:00:00.000Z",
      location: {
        name: "Queenstown",
        city: "Singapore",
        isVirtual: false,
      },
      coverImage:
        "https://og.luma.com/cdn-cgi/image/format=auto,fit=cover,dpr=1,anim=false,background=white,quality=75,width=800,height=420/event?calendar_avatar=https%3A%2F%2Fimages.lumacdn.com%2Fcalendars%2Fhv%2Fc3823d79-a718-463d-b7f7-a3afa2bf9822.png&calendar_name=adaption&color0=%23431612&color1=%23dadada&color2=%2345467f&color3=%23c0c0a1&img=https%3A%2F%2Fimages.lumacdn.com%2Fevent-covers%2Fs9%2Fe20b199a-82b9-4802-8793-8836336245dc.png&name=Adaption%20X%20Singapore%2C%20Hosted%20by%20Adaption%2C%20Lorong%20AI%20%26%20AI%20Singapore&palette_neutral=%23431612%3A63.04%2C%23dadada%3A2.56&palette_vibrant=%2345467f%3A1.39%2C%23c0c0a1%3A0.89",
    },
  },
  {
    sourceUrl: "https://luma.com/4ogc0024",
    type: "meetup",
    tags: ["Road to AIE", "Exa"],
    scrapeFallback: {
      title: "Celebrating Exa in Singapore",
      description:
        "APRIL 20 — Exa Lands in Singapore\nJoin our engineering and research teams in celebrating the launch of our Singapore office!\nCome for the food and drinks, stay…",
      date: "2026-04-20T11:00:00.000Z",
      endDate: "2026-04-20T13:00:00.000Z",
      location: {
        name: "Chinatown",
        city: "Singapore",
        isVirtual: false,
      },
      coverImage:
        "https://og.luma.com/cdn-cgi/image/format=auto,fit=cover,dpr=1,anim=false,background=white,quality=75,width=800,height=420/event?calendar_avatar=https%3A%2F%2Fcdn.lu.ma%2Favatars-default%2Fcommunity_avatar_23.png&color0=%230f0f15&color1=%234a3d3c&color2=%23f2f3f1&color3=%234b5e7b&host_avatar=https%3A%2F%2Fimages.lumacdn.com%2Favatars%2F51%2Fcc56cd67-be7e-453d-8594-af783fe7169c.jpg&host_name=Jessica%20Zhao&img=https%3A%2F%2Fimages.lumacdn.com%2Fevent-covers%2Fot%2Fb1d8f8eb-1838-40c1-995b-fb2cf9b5ef15.png&name=Celebrating%20Exa%20in%20Singapore&palette_neutral=%230f0f15%3A32.18%2C%23f2f3f1%3A7.56%2C%234a3d3c%3A9.11&palette_vibrant=%234b5e7b%3A5.68%2C%23f7dcbb%3A2.99%2C%23ad8370%3A3.27",
    },
  },

  {
    sourceUrl:
      "https://singapore.aitinkerers.org/p/ai-tinkerers-singapore-the-agentic-future-dev-eng-workflows",
    type: "meetup",
    tags: ["AI Tinkerers", "agents"],
    scrapeFallback: {
      title:
        "AI Tinkerers Singapore: The Agentic Future & Dev/Eng Workflows",
      description:
        "The Agentic Future & Dev/Eng Workflows As the frontier of AI shifts from simple chat interfaces to autonomous agents, the engineering challenges move to orchestration, reliability, and local execution efficiency. Join AI Tinkerers Singapore for an evening dedicated to the builders ...",
      date: "2026-04-21T10:00:00Z",
      endDate: "2026-04-21T13:00:00Z",
      location: {
        name: "Location shared with confirmed attendees only.",
        city: "Singapore",
        isVirtual: false,
      },
      coverImage:
        "https://sloppy-joe-app.imgix.net/blog_images/iney3owf5fq-jpg-H4dR.jpg?fm=jpg",
    },
  },
];
