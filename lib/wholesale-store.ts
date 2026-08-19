"use client";

import { useSyncExternalStore } from "react";
import type { WholesaleRequest } from "./wholesale";

const KEY = "elvaro-demande-gros";

let listeners: (() => void)[] = [];
let cachedRaw: string | null = null;
let cachedValue: WholesaleRequest | null = null;

/** Snapshot stable : on ne re-parse que si le contenu stocké a changé. */
function read(): WholesaleRequest | null {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    raw = null;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      cachedValue = raw ? (JSON.parse(raw) as WholesaleRequest) : null;
    } catch {
      cachedValue = null;
    }
  }
  return cachedValue;
}

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((item) => item !== listener);
  };
}

export function saveLastRequest(request: WholesaleRequest) {
  try {
    localStorage.setItem(KEY, JSON.stringify(request));
  } catch {
    /* navigation privée */
  }
  emit();
}

export function clearLastRequest() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* navigation privée */
  }
  emit();
}

/** La dernière demande envoyée depuis cet appareil, rendue après hydratation. */
export function useLastRequest() {
  return useSyncExternalStore(subscribe, read, () => null);
}
