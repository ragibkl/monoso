import React from "react";
import { FlexWidget, TextWidget } from "react-native-android-widget";

function TextLabel(props: { children: string; bold: boolean }) {
  return (
    <FlexWidget
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <TextWidget
        text={props.children}
        style={{
          fontSize: 10,
          fontWeight: props.bold ? "bold" : "normal",
          color: "#000000",
        }}
      />
    </FlexWidget>
  );
}

function TimeDisplay(props: { children: number; bold: boolean }) {
  const date = new Date(0);
  date.setUTCSeconds(props.children);
  const text = date.toLocaleString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <FlexWidget
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <TextWidget
        text={text}
        style={{
          fontSize: 10,
          fontWeight: props.bold ? "bold" : "normal",
          color: "#000000",
        }}
      />
    </FlexWidget>
  );
}

function Column(props: { label: string; time: number; bold: boolean }) {
  return (
    <FlexWidget
      style={{
        flex: 1,
        flexDirection: "column",
        height: "match_parent",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <TextLabel bold={props.bold}>{props.label}</TextLabel>
      <TimeDisplay bold={props.bold}>{props.time}</TimeDisplay>
    </FlexWidget>
  );
}

type HelloWidgetProps = {
  zone: string;
  fajr: number;
  syuruk: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
};

export function WaktuSolatWidget(props: HelloWidgetProps) {
  const date = new Date();
  const epoch = date.getTime() / 1000;

  const fajrBold = epoch >= props.fajr && epoch < props.syuruk;
  const syurukBold = epoch >= props.syuruk && epoch < props.dhuhr;
  const dhuhrBold = epoch >= props.dhuhr && epoch < props.asr;
  const asrBold = epoch >= props.asr && epoch < props.maghrib;
  const maghribBold = epoch >= props.maghrib && epoch < props.isha;
  const ishaBold = epoch >= props.isha;

  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        flex: 1,
        flexDirection: "column",
        height: "match_parent",
        width: "match_parent",
        justifyContent: "space-between",
        alignItems: "flex-start",
        backgroundColor: "#ffffff",
        borderRadius: 5,
        padding: 10,
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
          text={date.toDateString()}
          style={{ fontSize: 12, color: "#000000" }}
        />
        <TextWidget
          text={props.zone}
          style={{ fontSize: 12, color: "#000000" }}
        />
      </FlexWidget>

      <FlexWidget
        clickAction="WAKTU_SOLAT_CLICK_ACTION"
        style={{
          flex: 2,
          flexDirection: "row",
          width: "match_parent",
          borderRadius: 4,
          borderColor: "#000000",
          borderWidth: 1,
        }}
      >
        <Column label="Fajr" time={props.fajr} bold={fajrBold} />
        <Column label="Syuruk" time={props.syuruk} bold={syurukBold} />
        <Column label="Dhuhr" time={props.dhuhr} bold={dhuhrBold} />
        <Column label="Asr" time={props.asr} bold={asrBold} />
        <Column label="Maghrib" time={props.maghrib} bold={maghribBold} />
        <Column label="Isha" time={props.isha} bold={ishaBold} />
      </FlexWidget>
    </FlexWidget>
  );
}
