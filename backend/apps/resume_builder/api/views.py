from django.db.models import Count
from rest_framework import generics, viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsPortfolioAdmin
from apps.analytics_app.models import AnalyticsEvent
from apps.core.models import PublishableModel
from apps.resume_builder.api.serializers import AdminResumeVersionSerializer, PublicResumeVersionSerializer
from apps.resume_builder.models import ResumeVersion


class PublicDefaultResumeView(generics.RetrieveAPIView):
    serializer_class = PublicResumeVersionSerializer
    permission_classes = (AllowAny,)

    def get_object(self):
        return ResumeVersion.objects.filter(is_default=True, status=PublishableModel.Status.PUBLISHED).first()


class PublicResumeBySlugView(generics.RetrieveAPIView):
    serializer_class = PublicResumeVersionSerializer
    permission_classes = (AllowAny,)
    queryset = ResumeVersion.objects.filter(status=PublishableModel.Status.PUBLISHED)
    lookup_field = "slug"


class PublicResumeDownloadTrackView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request, slug):
        resume = ResumeVersion.objects.get(slug=slug)
        AnalyticsEvent.objects.create(
            event_type=AnalyticsEvent.EventType.RESUME_DOWNLOAD,
            page_path=f"/resume/{slug}",
            metadata={"source": request.data.get("source", "public")},
        )
        return Response({"message": "Resume download tracked", "resume": resume.slug})


class AdminResumeVersionViewSet(viewsets.ModelViewSet):
    permission_classes = (IsPortfolioAdmin,)
    serializer_class = AdminResumeVersionSerializer
    queryset = ResumeVersion.objects.all()
