import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import CategoryScreen from '../screens/CategoryScreen';
import TrendScreen from '../screens/TrendScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ChallengeDetailScreen from '../screens/ChallengeDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// 홈 스택
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="ChallengeDetail" component={ChallengeDetailScreen} />
    </Stack.Navigator>
  );
}

// 검색 스택
function SearchStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SearchMain" component={SearchScreen} />
      <Stack.Screen name="ChallengeDetail" component={ChallengeDetailScreen} />
    </Stack.Navigator>
  );
}

// 카테고리 스택
function CategoryStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CategoryMain" component={CategoryScreen} />
      <Stack.Screen name="ChallengeDetail" component={ChallengeDetailScreen} />
    </Stack.Navigator>
  );
}

// 트렌드 스택
function TrendStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TrendMain" component={TrendScreen} />
      <Stack.Screen name="ChallengeDetail" component={ChallengeDetailScreen} />
    </Stack.Navigator>
  );
}

// 프로필 스택
function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="ChallengeDetail" component={ChallengeDetailScreen} />
    </Stack.Navigator>
  );
}

export const RootNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            const icons = {
              Home: 'home',
              Search: 'search',
              Category: 'grid',
              Trend: 'trending-up',
              Profile: 'person'
            };
            return <Ionicons name={icons[route.name]} size={size} color={color} />;
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.text_tertiary,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            elevation: 8,
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            height: 85,
            paddingBottom: 28,
            paddingTop: 8,
          },
          tabBarLabel: ({ focused, color }) => {
            const labels = {
              Home: '홈',
              Search: '검색',
              Category: '카테고리',
              Trend: '트렌드',
              Profile: '프로필'
            };
            return (
              <Text
                style={{
                  color,
                  fontSize: 11,
                  fontWeight: focused ? '700' : '500',
                  marginTop: 4,
                }}
              >
                {labels[route.name]}
              </Text>
            );
          }
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeStack}
          options={{ title: '홈' }}
        />
        <Tab.Screen
          name="Search"
          component={SearchStack}
          options={{ title: '검색' }}
        />
        <Tab.Screen
          name="Category"
          component={CategoryStack}
          options={{ title: '카테고리' }}
        />
        <Tab.Screen
          name="Trend"
          component={TrendStack}
          options={{ title: '트렌드' }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileStack}
          options={{ title: '프로필' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};
