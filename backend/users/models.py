from django.db import models
from django.contrib.auth.models import User

# This class defines what each uploaded file will look like in the database
class UserFile(models.Model):
    # Link the file to the user who uploaded it
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="files")
    
    # The actual file (Django will store it inside a folder in your project)
    file = models.FileField(upload_to="uploads/")
    
    # Automatically save the time when the file was uploaded
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        # Just a readable name for admin panel or debugging
        return f"{self.user.username} - {self.file.name}"
