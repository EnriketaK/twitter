from django import forms

class PostForm(forms.Form):
    content = forms.CharField(max_length = 400)