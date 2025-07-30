import React from "react";
import { FlexWidget, TextWidget } from "react-native-android-widget";

import { PrayerTime } from "@/lib/data/waktuSolatStore";
import { Zone } from "@/lib/data/zoneStore";

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
          fontFamily: "LiberationMono",
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
          fontFamily: "LiberationMono",
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

type WaktuSolatWidgetProps = {
  date: Date;
  zone?: Zone;
  prayerTime?: PrayerTime;
};

export function WaktuSolatWidget(props: WaktuSolatWidgetProps) {
  const {
    date,
    prayerTime: {
      fajr = 0,
      syuruk = 0,
      dhuhr = 0,
      asr = 0,
      maghrib = 0,
      isha = 0,
    } = {},
    zone,
  } = props;

  const zoneText = zone
    ? `${zone.zone} - ${zone.district}, ${zone.state}`
    : "Location not set";

  const epoch = date.getTime() / 1000;
  const fajrBold = epoch >= fajr && epoch < syuruk;
  const syurukBold = epoch >= syuruk && epoch < dhuhr;
  const dhuhrBold = epoch >= dhuhr && epoch < asr;
  const asrBold = epoch >= asr && epoch < maghrib;
  const maghribBold = epoch >= maghrib && epoch < isha;
  const ishaBold = epoch >= isha;

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
          text={date.toLocaleString()}
          style={{
            fontSize: 12,
            color: "#000000",
            fontFamily: "LiberationMono",
          }}
        />
        <TextWidget
          text={zoneText}
          style={{
            fontSize: 12,
            color: "#000000",
            fontFamily: "LiberationMono",
          }}
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
        <Column label="Fajr" time={fajr} bold={fajrBold} />
        <Column label="Syuruk" time={syuruk} bold={syurukBold} />
        <Column label="Dhuhr" time={dhuhr} bold={dhuhrBold} />
        <Column label="Asr" time={asr} bold={asrBold} />
        <Column label="Maghrib" time={maghrib} bold={maghribBold} />
        <Column label="Isha" time={isha} bold={ishaBold} />
      </FlexWidget>
    </FlexWidget>
  );
}
