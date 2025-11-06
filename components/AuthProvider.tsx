"use client";

import { useUserStore } from "@/lib/stores/useUserStore";
import { useEffect } from "react";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
	const initAuthListener = useUserStore((state) => state.initAuthListener);

	useEffect(() => {
		initAuthListener();
	}, [initAuthListener]);

	return <>{children}</>;
}
