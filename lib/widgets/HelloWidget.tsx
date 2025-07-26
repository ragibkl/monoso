import React from "react";
import { FlexWidget, TextWidget } from "react-native-android-widget";

type HelloWidgetProps = {
  zone: string;
  fajr: number;
  syuruk: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
};

function TextLabel(props: { children: string }) {
  return (
    <TextWidget
      text={props.children}
      style={{
        fontSize: 10,
        color: "#000000",
      }}
    />
  );
}

function TimeDisplay(props: { children: number }) {
  const date = new Date(0);
  date.setUTCSeconds(props.children);
  const text = date.toLocaleString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <TextWidget
      text={text}
      style={{
        fontSize: 10,
        fontWeight: "bold",
        color: "#000000",
      }}
    />
  );
}

function Column(props: { label: string; time: number }) {
  return (
    <FlexWidget
      style={{
        flex: 1,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#ffffff",
        borderRadius: 4,
      }}
    >
      <TextLabel>{props.label}</TextLabel>
      <TimeDisplay>{props.time}</TimeDisplay>
    </FlexWidget>
  );
}

export function HelloWidget(props: HelloWidgetProps) {
  return (
    <FlexWidget
      style={{
        height: "match_parent",
        width: "match_parent",
        justifyContent: "space-evenly",
        alignItems: "flex-start",
        backgroundColor: "#ffffff",
        borderRadius: 5,
        padding: 5,
      }}
    >
      <FlexWidget
        style={{
          flexDirection: "row",
          width: "match_parent",
          justifyContent: "space-between",
        }}
      >
        <TextWidget
          text={`Date: ${props.zone}`}
          style={{ fontSize: 12, color: "#000000" }}
        />
        <TextWidget
          text={`Zone: ${props.zone}`}
          style={{ fontSize: 12, color: "#000000" }}
        />
      </FlexWidget>

      <FlexWidget
        style={{
          flexDirection: "row",
          width: "match_parent",
          borderRadius: 4,
          borderColor: "#000000",
          borderWidth: 1,
        }}
      >
        <Column label="Fajr" time={props.fajr} />
        <Column label="Syuruk" time={props.syuruk} />
        <Column label="Dhuhr" time={props.dhuhr} />
        <Column label="Asr" time={props.asr} />
        <Column label="Maghrib" time={props.maghrib} />
        <Column label="Isha" time={props.isha} />
      </FlexWidget>
    </FlexWidget>
  );
}
