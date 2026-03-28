import dayjs from "dayjs";

export const formatCurrency = (value: number, currency = "USD"): string => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return value.toFixed(2);
  }
};

export const formatSubscriptionDateTime = (value?: string): string => {
  if (!value) return "Not provided";
  const parsedDate = dayjs(value);
  return parsedDate.isValid() ? parsedDate.format("MM/DD/YYYY") : "Not provided";
};

export const formatStatusLabel = (value?: string): string => {
  if (!value) return "Unknown";
  return value.charAt(0).toUpperCase() + value.slice(1);
};

type UserLike = {
  imageUrl?: string | null;
  externalAccounts?: Array<{ imageUrl?: string | null }>;
  unsafeMetadata?: Record<string, unknown> | null;
  id?: string | null;
  createdAt?: string | number | Date | null;
};

export const getUserProfileImage = (user?: UserLike | null): string | null => {
  if (!user) return null;

  const unsafeAvatar = user.unsafeMetadata?.avatarUrl;
  if (typeof unsafeAvatar === "string" && unsafeAvatar.length > 0) {
    return unsafeAvatar;
  }

  if (typeof user.imageUrl === "string" && user.imageUrl.length > 0) {
    return user.imageUrl;
  }

  const externalImage = user.externalAccounts?.find((account) => account.imageUrl)?.imageUrl;
  if (typeof externalImage === "string" && externalImage.length > 0) {
    return externalImage;
  }

  return null;
};

export const formatAccountId = (value?: string | null): string => {
  if (!value) return "Unavailable";
  return value.length > 18 ? `${value.slice(0, 18)}...` : value;
};

export const formatJoinDate = (value?: string | number | Date | null): string => {
  if (!value) return "Unavailable";
  const parsedDate = dayjs(value);
  return parsedDate.isValid() ? parsedDate.format("DD.MM.YYYY") : "Unavailable";
};
