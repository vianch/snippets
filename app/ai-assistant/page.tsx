"use client";

import { ReactElement } from "react";

import SnippetsWorkspace from "@/components/SnippetsWorkspace/SnippetsWorkspace";

export default function Page(): ReactElement {
	return <SnippetsWorkspace rightPane="chat" />;
}
