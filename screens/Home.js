import { StatusBar } from "expo-status-bar";
import { StyleSheet, FlatList } from "react-native";
import Slideshow from "../components/Slideshow";
import LatestNews from "../components/LatestNews";
import DataFile from "../data.json";

const sections = [
  <Slideshow />,
  <LatestNews
    rssUrl={DataFile.news?.[4].url}
    website={DataFile.news?.[4].name}
    category="News"
    // language={DataFile.news?.[4].language}
    limit={5}
    showDropdown={false}
  />,
  <LatestNews
    rssUrl={DataFile.reviews?.[1].url}
    website={DataFile.news?.[1].name}
    category="Reviews"
    // language={DataFile.reviews?.[1].language}
    limit={5}
    showDropdown={false}
  />,
  <LatestNews
    rssUrl={DataFile.hardware?.[0].url}
    website={DataFile.news?.[0].name}
    category="Hardware"
    // language={DataFile.hardware?.[0].language}
    limit={5}
    showDropdown={false}
  />,
];

function Home() {
  const renderItem = ({ item }) => item;

  return (
    <>
      <FlatList
        data={sections}
        renderItem={renderItem}
        // keyExtractor={(item) => item.id}
        style={{ height: "100%", backgroundColor: "#0c1a33" }}
        showsVerticalScrollIndicator={false}
      />
      <StatusBar style="auto" />
    </>
  );
}
export default Home;
const styles = StyleSheet.create({});
