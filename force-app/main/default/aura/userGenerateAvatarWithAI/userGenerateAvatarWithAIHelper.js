({
  generateImage: function(cmp) {
    cmp.set("v.isLoading", true);
    let imageGeneratorAction = cmp.get("c.generateImage");
    let params = {
      prompt: cmp.get("v.prompt")
    };
    imageGeneratorAction.setParams(params);
    imageGeneratorAction.setCallback(this, function(response) {
      let state = response.getState();
      if (state === "SUCCESS") {
        let returnedValue = response.getReturnValue();
        console.log(returnedValue);
        let b64_json = returnedValue.data.data[0].b64_json;
        if (b64_json) {
          let imageSource = "data:image/png;base64," + b64_json;
          cmp.set("v.isImageUrl", false);
          cmp.set("v.imageSource", imageSource);
        } else {
          let imageSource = returnedValue.data.data[0].url;
          cmp.set("v.isImageUrl", true);
          cmp.set("v.imageSource", imageSource);
        }
      } else {
        console.log("Error: " + response.getError()[0].message);
      }
      cmp.set("v.isLoading", false);
    });
    $A.enqueueAction(imageGeneratorAction);
  },

  setAvatarImageHelper: function(cmp) {
    cmp.set("v.isLoading", true);
    let imageSource = cmp.get("v.imageSource");
    imageSource = imageSource.replace("data:image/png;base64,", "");
    let setAvatarImageAction = cmp.get("c.setAvatarImage");
    console.log("imageSource: " + imageSource);
    setAvatarImageAction.setParams({
      base64Data: imageSource,
      isUrl: cmp.get("v.isImageUrl")
    });
    setAvatarImageAction.setCallback(this, function(response) {
      let state = response.getState();
      if (state === "SUCCESS") {
        let returnedValue = response.getReturnValue();
        console.log(returnedValue);
        if (returnedValue.success) {
          alert("Avatar image set successfully");
        } else {
          alert("Error setting avatar: " + returnedValue.message);
        }
      } else {
        console.log("Error: " + response.getError()[0].message);
      }
      cmp.set("v.isLoading", false);
    });
    $A.enqueueAction(setAvatarImageAction);
  }
});