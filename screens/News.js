import * as React from "react";
import { View, useWindowDimensions, StyleSheet } from "react-native";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { useRSS } from "../contexts/RSSContext";
import LatestNews from "../components/LatestNews";
// import DropdownPicker from "../components/DropdownPicker";

const NewsRoute = () => {
  const { getFeedsByCategory } = useRSS();
  const newsFeeds = getFeedsByCategory("news");

  const [selected, setSelected] = React.useState(
    newsFeeds.length > 0
      ? {
          ...newsFeeds[0],
        }
      : { url: undefined, name: undefined, image: undefined }
  );

  return (
    <View style={styles.scene}>
      {/* <DropdownPicker /> */}
      <LatestNews
        rssUrl={selected.url}
        website={selected.name}
        category="News"
        selectedItem={selected}
        language={selected.language}
        onChangeFeed={(item) => setSelected(item)}
      />
    </View>
  );
};

const ReviewsRoute = () => {
  const { getFeedsByCategory } = useRSS();
  const reviewsFeeds = getFeedsByCategory("reviews");

  const [selected, setSelected] = React.useState(
    reviewsFeeds.length > 0
      ? {
          ...reviewsFeeds[0],
        }
      : { url: undefined, name: undefined, image: undefined }
  );

  return (
    <View style={styles.scene}>
      <LatestNews
        rssUrl={selected.url}
        website={selected.name}
        category="Reviews"
        selectedItem={selected}
        language={selected.language}
        onChangeFeed={(item) => setSelected(item)}
      />
    </View>
  );
};

const HardwareRoute = () => {
  const { getFeedsByCategory } = useRSS();
  const hardwareFeeds = getFeedsByCategory("hardware");

  const [selected, setSelected] = React.useState(
    hardwareFeeds.length > 0
      ? {
          ...hardwareFeeds[0],
        }
      : { url: undefined, name: undefined, image: undefined }
  );

  return (
    <View style={styles.scene}>
      <LatestNews
        rssUrl={selected.url}
        website={selected.name}
        category="Hardware"
        selectedItem={selected}
        language={selected.language}
        onChangeFeed={(item) => setSelected(item)}
      />
    </View>
  );
};

export default function TabViewExample() {
  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: "news", title: "News" },
    { key: "reviews", title: "Reviews" },
    { key: "hardware", title: "Hardware" },
  ]);

  const renderScene = SceneMap({
    news: NewsRoute,
    reviews: ReviewsRoute,
    hardware: HardwareRoute,
  });

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
      renderTabBar={(props) => (
        <TabBar
          {...props}
          style={{ backgroundColor: "#0a0f1c", paddingTop: 50 }}
          indicatorStyle={{ backgroundColor: "#516996" }}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  scene: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0c1a33",
  },
});
