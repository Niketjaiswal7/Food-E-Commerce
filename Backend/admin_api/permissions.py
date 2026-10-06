from rest_framework.permissions import BasePermission


class IsAdminOrReadOnly(BasePermission):
    """
    Anyone can view data using GET.
    Only admin/staff users can create, update or delete data.
    """

    def has_permission(self, request, view):
        # GET, HEAD and OPTIONS are allowed for everyone
        if request.method in ["GET", "HEAD", "OPTIONS"]:
            return True

        # POST, PUT, PATCH, DELETE require admin/staff user
        return (
            request.user
            and request.user.is_authenticated
            and request.user.is_staff
        )