"use client";

import React, { ReactNode } from "react";
import { Provider as ReduxProvider } from "react-redux";

import { store } from "~/store";

interface MainProviderProps {
  children?: ReactNode;
}

function MainProvider(props: MainProviderProps) {
  const { children } = props;

  return <ReduxProvider store={store}>{children}</ReduxProvider>;
}

export { MainProvider };
