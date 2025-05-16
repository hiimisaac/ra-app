import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, LogOut, Award, Calendar, Settings, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Button from '@/components/ui/Button';
import ProfileStats from '@/components/ProfileStats';
import UserActivityItem from '@/components/UserActivityItem';
import { userActivities } from '@/data/mockData';

export default function ProfileScreen() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState({
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    avatar: 'https://images.pexels.com/photos/3756985/pexels-photo-3756985.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=150',
    volunteerHours: 45,
    eventsAttended: 8,
    donationsMade: 3,
  });

  const handleLogin = () => {
    // Simulate login process
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Log Out", 
          onPress: () => setIsLoggedIn(false),
          style: "destructive"
        }
      ]
    );
  };

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loginContainer}>
          <User size={80} color={Colors.primary} style={styles.userIcon} />
          <Text style={styles.loginTitle}>Create Your Profile</Text>
          <Text style={styles.loginSubtitle}>Sign up to track your volunteer activities, RSVP to events, and more.</Text>
          <Button 
            title="Sign In / Create Account" 
            onPress={handleLogin} 
            style={styles.loginButton}
          />
          <TouchableOpacity style={styles.skipButton}>
            <Text style={styles.skipButtonText}>Continue as Guest</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.profileHeader}>
            <Image source={{ uri: userData.avatar }} style={styles.avatar} />
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{userData.name}</Text>
              <Text style={styles.email}>{userData.email}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ProfileStats 
          volunteerHours={userData.volunteerHours} 
          eventsAttended={userData.eventsAttended}
          donations={userData.donationsMade}
        />
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityContainer}>
            {userActivities.map(activity => (
              <UserActivityItem key={activity.id} activity={activity} />
            ))}
          </View>
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All Activities</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.settingsContainer}>
            <TouchableOpacity style={styles.settingsItem}>
              <View style={styles.settingsItemContent}>
                <Calendar size={22} color={Colors.primary} style={styles.settingsIcon} />
                <Text style={styles.settingsText}>Calendar Integration</Text>
              </View>
              <ChevronRight size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingsItem}>
              <View style={styles.settingsItemContent}>
                <Award size={22} color={Colors.primary} style={styles.settingsIcon} />
                <Text style={styles.settingsText}>Volunteer Preferences</Text>
              </View>
              <ChevronRight size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingsItem}>
              <View style={styles.settingsItemContent}>
                <Settings size={22} color={Colors.primary} style={styles.settingsIcon} />
                <Text style={styles.settingsText}>Account Settings</Text>
              </View>
              <ChevronRight size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  userIcon: {
    marginBottom: 24,
    backgroundColor: Colors.primaryLight,
    padding: 16,
    borderRadius: 40,
  },
  loginTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  loginSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  loginButton: {
    width: '100%',
    marginBottom: 16,
  },
  skipButton: {
    paddingVertical: 12,
  },
  skipButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
  },
  profileInfo: {
    justifyContent: 'center',
  },
  name: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  email: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.textSecondary,
  },
  logoutButton: {
    padding: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: Colors.textPrimary,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  activityContainer: {
    paddingHorizontal: 16,
  },
  viewAllButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  viewAllText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.primary,
  },
  settingsContainer: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingsItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsIcon: {
    marginRight: 16,
  },
  settingsText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.textPrimary,
  },
});