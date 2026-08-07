const Haptics = {
  NotificationFeedbackType: {
    Success: "success",
  },
  ImpactFeedbackStyle: {
    Medium: "medium",
  },
  async notificationAsync() {
    return Promise.resolve();
  },
  async impactAsync() {
    return Promise.resolve();
  },
};

export default Haptics;
