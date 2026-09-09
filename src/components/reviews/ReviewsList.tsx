import { View } from 'react-native';
import { AppText } from '../ui';
import { useTheme } from '../../theme';
import { usePublicReviews } from '../../features/reviews/queries';
import type { ReviewSubjectType } from '../../api/reviews.api';
import { RatingStars } from './RatingStars';

interface ReviewsListProps {
  subjectType: ReviewSubjectType;
  subjectId: string | undefined;
  title?: string;
}

export function ReviewsList({ subjectType, subjectId, title = 'Reviews' }: ReviewsListProps) {
  const { colors, spacing } = useTheme();
  const { data, isLoading } = usePublicReviews(subjectType, subjectId);

  if (!subjectId || isLoading) return null;

  if (!data || data.data.length === 0) {
    return (
      <View>
        <AppText variant="label" style={{ marginBottom: spacing.xs }}>
          {title}
        </AppText>
        <AppText muted variant="caption">
          No reviews yet.
        </AppText>
      </View>
    );
  }

  return (
    <View>
      <AppText variant="label" style={{ marginBottom: spacing.sm }}>
        {title} <AppText muted variant="caption">({data.meta.total})</AppText>
      </AppText>
      {data.data.map((review, index) => (
        <View
          key={review.id}
          style={{
            borderTopWidth: index === 0 ? 0 : 1,
            borderTopColor: colors.border,
            paddingTop: index === 0 ? 0 : spacing.sm,
            marginTop: index === 0 ? 0 : spacing.sm,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <AppText variant="caption" style={{ fontFamily: 'Outfit_600SemiBold' }}>
              {review.author.name}
            </AppText>
            <RatingStars value={review.rating} size="sm" />
          </View>
          {review.comment ? (
            <AppText muted variant="caption" style={{ marginTop: spacing.xs }}>
              {review.comment}
            </AppText>
          ) : null}
          <AppText muted variant="caption" style={{ marginTop: spacing.xs }}>
            {new Date(review.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
          </AppText>
        </View>
      ))}
    </View>
  );
}
