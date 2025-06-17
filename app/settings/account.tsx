import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, User, Mail, Lock, Shield, Eye, EyeOff, Trash2 } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Button from '@/components/ui/Button';
import { AuthService, UserProfile } from '@/lib/auth';

export default function AccountSettingsScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Settings state
  const [loginNotifications, setLoginNotifications] = useState(true);
  const [dataExportEnabled, setDataExportEnabled] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    const currentUser = await AuthService.getCurrentUser();
    setUser(currentUser);
    
    if (currentUser) {
      const { profile } = await AuthService.getUserProfile(currentUser.id);
      setUserProfile(profile);
      
      if (profile) {
        setName(profile.name);
        setEmail(profile.email);
      }
    }
  };

  const handleUpdateProfile = async () => {
    if (!user || !userProfile) return;

    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    setLoading(true);
    try {
      console.log('Updating profile with name:', name.trim());
      
      const { profile, error } = await AuthService.updateUserProfile(user.id, {
        name: name.trim(),
        // Don't update email as it's read-only
      });

      if (error) {
        console.error('Profile update error:', error);
        Alert.alert('Error', error);
        return;
      }

      if (profile) {
        console.log('Profile updated successfully:', profile);
        setUserProfile(profile);
        
        // Show success and navigate back to refresh the main profile screen
        Alert.alert(
          'Success', 
          'Profile updated successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate back to trigger a refresh of the profile screen
                router.back();
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      // In a real app, you'd verify the current password and update it
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordFields(false);
      
      Alert.alert('Success', 'Password changed successfully!');
    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert('Error', 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: confirmDeleteAccount
        }
      ]
    );
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      'Final Confirmation',
      'This will permanently delete your account and all associated data. Type "DELETE" to confirm.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Delete',
          style: 'destructive',
          onPress: async () => {
            // In a real app, you'd call the delete account API
            Alert.alert('Account Deletion', 'Account deletion would be processed here. For demo purposes, this is not implemented.');
          }
        }
      ]
    );
  };

  const handleExportData = async () => {
    if (!user) return;

    Alert.alert(
      'Export Data',
      'We will prepare your data export and send it to your email address. This may take a few minutes.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: async () => {
            // In a real app, you'd trigger the data export process
            Alert.alert('Export Started', 'Your data export has been started. You will receive an email when it\'s ready.');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Account Settings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <User size={24} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Profile Information</Text>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={email}
              editable={false}
              placeholder="Email address"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Text style={styles.inputNote}>Email cannot be changed. Contact support if needed.</Text>
          </View>

          <Button
            title={loading ? "Updating..." : "Update Profile"}
            onPress={handleUpdateProfile}
            disabled={loading || !name.trim() || name.trim() === userProfile?.name}
            style={styles.updateButton}
          />
        </View>

        {/* Password & Security */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Lock size={24} color={Colors.secondary} />
            <Text style={styles.sectionTitle}>Password & Security</Text>
          </View>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => setShowPasswordFields(!showPasswordFields)}
          >
            <Text style={styles.actionText}>Change Password</Text>
            <Text style={styles.actionArrow}>{showPasswordFields ? '−' : '+'}</Text>
          </TouchableOpacity>

          {showPasswordFields && (
            <View style={styles.passwordSection}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Current Password</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder="Enter current password"
                    secureTextEntry={!showCurrentPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff size={20} color={Colors.textSecondary} />
                    ) : (
                      <Eye size={20} color={Colors.textSecondary} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>New Password</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Enter new password"
                    secureTextEntry={!showNewPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff size={20} color={Colors.textSecondary} />
                    ) : (
                      <Eye size={20} color={Colors.textSecondary} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirm New Password</Text>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm new password"
                  secureTextEntry={true}
                />
              </View>

              <Button
                title={loading ? "Changing..." : "Change Password"}
                onPress={handleChangePassword}
                disabled={loading}
                variant="secondary"
                style={styles.changePasswordButton}
              />
            </View>
          )}

          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Login Notifications</Text>
              <Text style={styles.settingDescription}>
                Get notified when someone signs into your account
              </Text>
            </View>
            <Switch
              value={loginNotifications}
              onValueChange={setLoginNotifications}
              trackColor={{ false: Colors.border, true: Colors.primaryLight }}
              thumbColor={loginNotifications ? Colors.primary : Colors.muted}
            />
          </View>
        </View>

        {/* Privacy & Data */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Shield size={24} color={Colors.highlight} />
            <Text style={styles.sectionTitle}>Privacy & Data</Text>
          </View>

          <TouchableOpacity style={styles.actionItem} onPress={handleExportData}>
            <Text style={styles.actionText}>Export My Data</Text>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>

          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Data Export</Text>
              <Text style={styles.settingDescription}>
                Allow exporting your volunteer data and activities
              </Text>
            </View>
            <Switch
              value={dataExportEnabled}
              onValueChange={setDataExportEnabled}
              trackColor={{ false: Colors.border, true: Colors.primaryLight }}
              thumbColor={dataExportEnabled ? Colors.primary : Colors.muted}
            />
          </View>
        </View>

        {/* Danger Zone */}
        <View style={[styles.section, styles.dangerSection]}>
          <View style={styles.sectionHeader}>
            <Trash2 size={24} color={Colors.error} />
            <Text style={[styles.sectionTitle, styles.dangerTitle]}>Danger Zone</Text>
          </View>

          <TouchableOpacity style={styles.dangerAction} onPress={handleDeleteAccount}>
            <Text style={styles.dangerActionText}>Delete Account</Text>
            <Text style={styles.dangerActionDescription}>
              Permanently delete your account and all data
            </Text>
          </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: Colors.textPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: Colors.textPrimary,
    marginLeft: 12,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.textPrimary,
    backgroundColor: Colors.white,
  },
  disabledInput: {
    backgroundColor: Colors.background,
    color: Colors.textSecondary,
  },
  inputNote: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.white,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.textPrimary,
  },
  eyeButton: {
    padding: 12,
  },
  updateButton: {
    marginTop: 8,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: Colors.background,
    borderRadius: 8,
    marginBottom: 8,
  },
  actionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.textPrimary,
  },
  actionArrow: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: Colors.textSecondary,
  },
  passwordSection: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  changePasswordButton: {
    marginTop: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingContent: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  settingDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  dangerSection: {
    borderWidth: 1,
    borderColor: Colors.error + '30',
    marginBottom: 32,
  },
  dangerTitle: {
    color: Colors.error,
  },
  dangerAction: {
    backgroundColor: Colors.error + '10',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.error + '30',
  },
  dangerActionText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: Colors.error,
    marginBottom: 4,
  },
  dangerActionDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.error,
    opacity: 0.8,
  },
});