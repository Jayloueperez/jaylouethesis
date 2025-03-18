"use client";

import React, { ReactNode } from "react";
import { Provider as ReduxProvider } from "react-redux";

import { store } from "~/store";

interface ProvidersProps {
  children?: ReactNode;
}

const Providers = (props: ProvidersProps) => {
  const { children } = props;

  return <ReduxProvider store={store}>{children}</ReduxProvider>;
};

export { Providers };
