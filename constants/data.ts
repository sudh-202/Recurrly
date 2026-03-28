import { icons } from "./icons";

export const tabs: AppTab[] = [
    { name: "index", title: "Home", icon: icons.home },
    { name: "subscriptions", title: "Subscriptions", icon: icons.wallet },
    { name: "insights", title: "Insights", icon: icons.activity },
    { name: "settings", title: "Settings", icon: icons.setting },
];

export const HOME_USER = {
    name: "Adrian | JS Mastery",
};

export const HOME_BALANCE = {
    amount: 2489.48,
    nextRenewalDate: "2026-03-18T09:00:00.000Z",
};

export const PROFILE_AVATARS = [
    {
        id: "panda",
        label: "Panda",
        uri: "https://api.dicebear.com/9.x/adventurer/png?seed=PixelPanda&backgroundColor=b6e3f4",
    },
    {
        id: "otter",
        label: "Otter",
        uri: "https://api.dicebear.com/9.x/adventurer/png?seed=HappyOtter&backgroundColor=c0aede",
    },
    {
        id: "fox",
        label: "Fox",
        uri: "https://api.dicebear.com/9.x/adventurer/png?seed=JellyFox&backgroundColor=ffd5dc",
    },
    {
        id: "koala",
        label: "Koala",
        uri: "https://api.dicebear.com/9.x/adventurer/png?seed=ChillKoala&backgroundColor=ffdfbf",
    },
] as const;

export const UPCOMING_SUBSCRIPTIONS: UpcomingSubscription[] = [
    {
        id: "spotify",
        icon: icons.spotify,
        name: "Spotify",
        price: 5.99,
        currency: "USD",
        daysLeft: 2,
    },
    {
        id: "notion",
        icon: icons.notion,
        name: "Notion",
        price: 12.0,
        currency: "USD",
        daysLeft: 4,
    },
    {
        id: "figma",
        icon: icons.figma,
        name: "Figma",
        price: 15.0,
        currency: "USD",
        daysLeft: 6,
    },
];

export const HOME_SUBSCRIPTIONS: Subscription[] = [
    {
        id: "adobe-creative-cloud",
        icon: icons.adobe,
        name: "Adobe Creative Cloud",
        plan: "Teams Plan",
        category: "Design",
        paymentMethod: "Visa ending in 8530",
        status: "active",
        startDate: "2025-03-20T10:00:00.000Z",
        price: 4699.0,
        currency: "INR",
        billing: "Monthly",
        renewalDate: "2026-04-20T10:00:00.000Z",
        color: "#f5c542",
        manageUrl: "https://account.adobe.com/plans",
        planUrl: "https://www.adobe.com/creativecloud/plans.html",
    },
    {
        id: "github-pro",
        icon: icons.github,
        name: "GitHub Pro",
        plan: "Developer Plan",
        category: "Developer Tools",
        paymentMethod: "Mastercard ending in 2408",
        status: "active",
        startDate: "2024-11-24T10:00:00.000Z",
        price: 829.0,
        currency: "INR",
        billing: "Monthly",
        renewalDate: "2026-04-24T10:00:00.000Z",
        color: "#e8def8",
        manageUrl: "https://github.com/settings/billing",
        planUrl: "https://github.com/settings/billing/plans",
    },
    {
        id: "claude-pro",
        icon: icons.claude,
        name: "Claude Pro",
        plan: "Pro Plan",
        category: "AI Tools",
        paymentMethod: "Amex ending in 1010",
        status: "active",
        startDate: "2025-06-27T10:00:00.000Z",
        price: 1662.0,
        currency: "INR",
        billing: "Monthly",
        renewalDate: "2026-04-27T10:00:00.000Z",
        color: "#b8d4e3",
        manageUrl: "https://claude.ai/settings",
        planUrl: "https://claude.ai/upgrade",
    },
    {
        id: "canva-pro",
        icon: icons.canva,
        name: "Canva Pro",
        plan: "Yearly Access",
        category: "Design",
        paymentMethod: "Visa ending in 7784",
        status: "active",
        startDate: "2024-04-02T10:00:00.000Z",
        price: 9999.0,
        currency: "INR",
        billing: "Yearly",
        renewalDate: "2026-07-02T10:00:00.000Z",
        color: "#b8e8d0",
        manageUrl: "https://www.canva.com/settings/billing/",
        planUrl: "https://www.canva.com/upgrade/",
    },
];
