"use client";

import { useEffect } from "react";
import { useUserStore } from "@/lib/stores/useUserStore";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
	const initAuthListener = useUserStore((state) => state.initAuthListener);

	useEffect(() => {
		initAuthListener();
	}, [initAuthListener]);

	return <>{children}</>;
}
