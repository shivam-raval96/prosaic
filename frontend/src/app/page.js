"use client";

import Homepage from "../components/homepage";
import Navigation from "../components/Navigation";
import ClientOnly from "../components/ClientOnly";

export default function Page() {
  return (
    <>
      <Navigation />
      <ClientOnly>
        <Homepage />
      </ClientOnly>
    </>
  );
}
