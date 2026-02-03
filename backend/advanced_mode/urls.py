
from django.urls import path
from .views import ExperimentStartView, ExperimentMutateView, ExperimentAnalyzeView

urlpatterns = [
    path('start/', ExperimentStartView.as_view(), name='experiment_start'),
    path('mutate/', ExperimentMutateView.as_view(), name='experiment_mutate'),
    path('analyze/', ExperimentAnalyzeView.as_view(), name='experiment_analyze'),
]
