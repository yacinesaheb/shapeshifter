from django.contrib import admin
from .models import UserFile


@admin.register(UserFile)
class UserFileAdmin(admin.ModelAdmin):
    list_display = ('user', 'file', 'uploaded_at')  # columns shown in admin list
    search_fields = ('user__username', 'file')       # add search by username or file
    list_filter = ('uploaded_at',)                   # filter by upload date
