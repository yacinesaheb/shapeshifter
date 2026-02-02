from django.db import models
from django.contrib.auth.models import User

class File(models.Model):
    owner = models.ForeignKey(
        User, on_delete=models.CASCADE, null=True, blank=True
    )  # allow empty owner
    name = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    file = models.FileField(upload_to="uploads/")

    def __str__(self):
        return self.name
