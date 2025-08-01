"use client";

import AboutPage from "../../components/about";
import Navigation from "../../components/Navigation";
import ClientOnly from "../../components/ClientOnly";

export default function About() {
  return (
    <>
      <Navigation />
      <ClientOnly>
        <AboutPage />
      </ClientOnly>
    </>
  );
}
