To build and publish a release of the official Docker image, in this example patch version `v1.0.1`:

1. Create a tag with name `v1.0.1`

```
% git tag v1.0.1
```

2. Push the tag to GitHub remote

```
% git push --tags
```

3. Open browser and navigate to the repository on GitHub. Go to the Releases section by clicking on the Releases header on the right side of the page.

4. Click on Create a new release and choose the tag `v1.0.1` that you created.

5. Describe the release by adding release notes in the markdown input field.

6. Click on Publish release.

This will trigger a GitHub action that will build Docker image and tag it with `v1.0.1` and push to container registry.
