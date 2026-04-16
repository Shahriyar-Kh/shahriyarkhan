from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from rest_framework import serializers

from apps.inquiries.models import ContactMessage, ServiceRequest


def _send_notification(template_base: str, subject: str, payload: dict) -> None:
    text_body = render_to_string(f"emails/{template_base}.txt", payload)
    html_body = render_to_string(f"emails/{template_base}.html", payload)
    msg = EmailMultiAlternatives(
        subject=subject,
        body=text_body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[settings.ADMIN_NOTIFICATION_EMAIL],
    )
    msg.attach_alternative(html_body, "text/html")
    msg.send(fail_silently=False)


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = "__all__"
        read_only_fields = ("status", "admin_notes", "created_at", "updated_at")

    def create(self, validated_data):
        message = super().create(validated_data)
        _send_notification(
            template_base="contact_notification",
            subject=f"[Portfolio] New Contact Message: {message.subject}",
            payload={"obj": message},
        )
        return message


class ServiceRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceRequest
        fields = "__all__"
        read_only_fields = ("status", "admin_notes", "created_at", "updated_at")

    def create(self, validated_data):
        request_obj = super().create(validated_data)
        _send_notification(
            template_base="service_request_notification",
            subject=f"[Portfolio] New Service Request: {request_obj.subject}",
            payload={"obj": request_obj},
        )
        return request_obj


class AdminContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = "__all__"


class AdminServiceRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceRequest
        fields = "__all__"
