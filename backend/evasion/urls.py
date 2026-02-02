from django.urls import path
from .views import MutatePayloadView

urlpatterns = [
    path('mutate/', MutatePayloadView.as_view(), name='mutate_payload'),
]
