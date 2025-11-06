export interface NavLink {
	name: string;
	path: string;
	icon?: string;
	adminOnly: boolean;
	authRequired: boolean;
}

export const coreNavigationLinks: NavLink[] = [
	{
		name: "Home",
		path: "/",
		icon: "home",
		adminOnly: false,
		authRequired: false,
	},
	{
		name: "Applications",
		path: "/apps",
		icon: "application",
		adminOnly: false,
		authRequired: false,
	},
	{
		name: "Technologies",
		path: "/technologies",
		icon: "code",
		adminOnly: false,
		authRequired: false,
	},
	{
		name: "Settings",
		path: "/settings",
		icon: "settings",
		adminOnly: false,
		authRequired: true,
	},
	{
		name: "Admin Dashboard",
		path: "/admin",
		icon: "manage-protection",
		adminOnly: true,
		authRequired: true,
	},
];

export const footerLinks: NavLink[] = [
	{ name: "About", path: "/about", adminOnly: false, authRequired: false },
	{ name: "Privacy", path: "/privacy", adminOnly: false, authRequired: false },
	{ name: "Terms", path: "/terms", adminOnly: false, authRequired: false },
	{ name: "Contact", path: "/contact", adminOnly: false, authRequired: false },
	{ name: "Cookies", path: "/cookies", adminOnly: false, authRequired: false },
	{ name: "Careers", path: "/careers", adminOnly: false, authRequired: false },
];
